
import { GoogleGenAI } from "@google/genai";
import { AppData, Investment } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's set in the environment.
  console.warn("API_KEY environment variable not set for Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const getFinancialSummary = (data: AppData): string => {
  const totalIncome = data.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = data.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netFlow / totalIncome) * 100 : 0;
  
  const totalInvestments = data.investments.reduce((sum, i) => sum + i.amount, 0);
  const totalDebt = data.debts
    .filter(d => d.type === 'BORROWED')
    .reduce((sum, d) => sum + d.amount, 0);

  return `
    - Monthly Net Cash Flow: ${netFlow > 0 ? 'Positive' : 'Negative'}
    - Approximate Savings Rate: ${savingsRate.toFixed(0)}%
    - Total invested amount: ${totalInvestments > 0 ? 'Significant' : 'Low'}
    - Total debt amount: ${totalDebt > 0 ? 'Has debt obligations' : 'No significant debt'}
    - Number of investments: ${data.investments.length}
  `;
};

export const analyzeInvestment = async (investment: Investment, data: AppData): Promise<string> => {
  const financialSummary = getFinancialSummary(data);
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are "Hadj", a prudent and ethical financial assistant specializing in Halal finance principles.
    A user has asked for an analysis of the following investment, given their financial context.
    Provide a structured analysis covering profitability, risk, and Sharia compliance, and end with a final recommendation.
    Be balanced, wise, and avoid emotional language.

    **User's Financial Summary (Anonymized):**
    ${financialSummary}

    **Investment Details:**
    - Name: ${investment.name}
    - Country: ${investment.country}
    - Sector: ${investment.sector}
    - Risk Level (as stated by user): ${investment.riskLevel}
    - User's notes on Sharia Compliance: "${investment.shariaComplianceNotes}"

    **Your Analysis (provide in Markdown format):**
    1.  **Profitability Potential:** 
    2.  **Risk Assessment:** 
    3.  **Sharia Compliance Analysis:**
    4.  **Final Recommendation:** 
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error in analyzeInvestment:", error);
    return "Error: Could not get analysis from AI assistant.";
  }
};

export const getDashboardInsights = async (data: AppData): Promise<string> => {
    if (data.transactions.length === 0) {
        return "Start by adding your first income or expense to get personalized insights from Hadj.";
    }

    const financialSummary = getFinancialSummary(data);
    const model = 'gemini-2.5-flash';
    const prompt = `
        You are "Hadj", a proactive and encouraging financial assistant.
        Based on the user's anonymized financial summary for the month, provide one or two brief, actionable, and encouraging insights.
        Focus on positive reinforcement or gentle guidance.

        **User's Financial Summary (Anonymized):**
        ${financialSummary}

        **Example Responses:**
        - "Your savings rate is excellent this month! Keep up the great work."
        - "Your spending on 'Entertainment' is a bit higher than usual. It might be a good time to review your budget."
        - "You have a positive cash flow, which is a great foundation for building wealth."

        **Your Insight:**
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error in getDashboardInsights:", error);
        return "Could not fetch insights at this time.";
    }
};

export const chatWithHadj = async (history: { role: string, parts: {text: string}[] }[], message: string, data: AppData): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const financialSummary = getFinancialSummary(data);

    try {
        const chat = ai.chats.create({
            model: model,
            config: {
                systemInstruction: `You are "Hadj", a prudent and ethical financial assistant specializing in Halal finance principles. The user's current financial summary is as follows:\n${financialSummary}\n Use this context to provide personalized, logical, and unemotional advice. Do not mention that you have this summary unless it's directly relevant to the user's question.`
            },
        });
        
        // This is a simplified chat history management for a single turn. 
        // For a real app, you would pass the full history.
        const response = await chat.sendMessage({ message: message });

        return response.text;

    } catch (error) {
        console.error("Gemini API error in chatWithHadj:", error);
        return "I am unable to respond at the moment. Please try again later.";
    }
}
