import { Request, Response } from 'express'
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';
import Stripe from 'stripe';
import { log } from 'node:console';

export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        res.json({ credits: user?.credits })
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

// To create new project
export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;

    try {
        const { initial_prompt } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user && user.credits < 5) {
            return res.status(403).json({
                message: 'add credits to create more projects'
            });
        }

        // create new project
        const project = await prisma.websiteProject.create({
            data: {
                name:
                    initial_prompt.length > 50
                        ? initial_prompt.substring(0, 47) + '...'
                        : initial_prompt,
                initial_prompt,
                userId
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { totalCreation: { increment: 1 } }
        });

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        });

        // respond early
        res.json({ projectId: project.id });

        // PROMPT ENHANCEMENT
        const promptEnhanceResponse =
            await openai.chat.completions.create({
                model: 'google/gemma-7b-it:free',
                messages: [
                    {
                        role: 'system',
                        content: `
You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

Enhance this prompt by:
1. Adding specific design details
2. Specifying key sections and features
3. Describing user experience and interactions
4. Including modern web design best practices
5. Mentioning responsive design requirements
6. Adding any missing but important elements

Return ONLY the enhanced prompt.
`
                    },
                    {
                        role: 'user',
                        content: initial_prompt
                    }
                ]
            });

        const enhancedPrompt =
            promptEnhanceResponse.choices[0].message.content ||
            initial_prompt;

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                projectId: project.id
            }
        });

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'now generating your website...',
                projectId: project.id
            }
        });

        // CODE GENERATION
        const codeGenerationResponse =
            await openai.chat.completions.create({
                model: 'meta-llama/llama-3-8b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: `
You are an expert web developer.

CRITICAL REQUIREMENTS:
- Return ONLY valid HTML
- Use Tailwind CSS for ALL styling
- Include <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in <head>
- Include all JS inside <script> before </body>
- No markdown
- No explanations
- Output must be a complete standalone HTML document
`
                    },
                    {
                        role: 'user',
                        content: enhancedPrompt
                    }
                ]
            });

        const code =
            codeGenerationResponse.choices[0].message.content || '';

        if (!code) {

            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content:
                        'Unable to generate the code, please try again',
                    projectId: project.id
                }
            });

            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            });

            return;
        }

        const cleanCode = code
            .replace(/```[a-z]*\n?/gi, '')
            .replace(/```$/g, '')
            .trim();

        const version = await prisma.version.create({
            data: {
                code: cleanCode,
                description: 'initial version',
                projectId: project.id
            }
        });

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content:
                    "I've created your website! You can preview it and request changes.",
                projectId: project.id
            }
        });

        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                current_code: cleanCode,
                current_version_index: version.id
            }
        });

    } catch (error: any) {

        try {
            if (userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { credits: { increment: 5 } }
                });
            }
        } catch (dbError) {
            console.log(dbError);
        }

        console.log(error.code || error.message);

        // IMPORTANT FIX
        if (!res.headersSent) {
            return res.status(500).json({
                message: error.message
            });
        }
    }
};