import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { questionText, userAnswer, guidancePoints, category, difficulty } =
      (await req.json()) as {
        questionText: string;
        userAnswer: string;
        guidancePoints: string[];
        category: string;
        difficulty: string;
      };

    if (!questionText || !userAnswer) {
      return NextResponse.json(
        { error: "Missing question or answer" },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    const rubric = guidancePoints.map((p, i) => `${i + 1}. ${p}`).join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1200,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a senior Solutions Engineer with 10 years of experience at OpenAI, evaluating a candidate's interview response.

Score their answer on a 1-5 scale:
1 = Poor (major gaps, factual errors)
2 = Below Average (some relevant points but significant omissions)
3 = Average (covers basics but lacks depth or specifics)
4 = Good (strong answer with specific examples and good structure)
5 = Excellent (comprehensive, specific, well-structured, shows deep expertise)

The candidate is at the ${difficulty} level. Adjust expectations accordingly.
Category: ${category}

Evaluation rubric — the answer should cover these points:
${rubric}

Return a JSON object with exactly these fields:
{
  "score": <number 1-5>,
  "strengths": [<array of 2-4 specific things they did well>],
  "improvements": [<array of 2-4 specific things to improve>],
  "modelAnswer": "<a strong reference answer in 2-3 paragraphs>",
  "interviewerPerspective": "<1-2 sentences on what an interviewer would think of this answer>"
}

Be specific and constructive. Reference exact phrases from their answer when noting strengths or improvements.`,
        },
        {
          role: "user",
          content: `Interview question: "${questionText}"\n\nCandidate's answer:\n${userAnswer}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const feedback = JSON.parse(raw);

    return NextResponse.json(feedback);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
