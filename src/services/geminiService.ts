import { GoogleGenAI } from "@google/genai";
import { Risk, Project, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMonthlyReview = async (
  month: string,
  projects: Project[],
  tasks: Task[],
  risks: Risk[]
): Promise<{ summary: string; achievements: string; issues: string; nextSteps: string }> => {
  
  const completedTasks = tasks.filter(t => t.status === 'Completed').map(t => t.title).join(', ');
  const activeRisks = risks.filter(r => r.status === 'Open' || r.status === 'In Progress').map(r => r.description).join(', ');
  
  const projectSummaries = projects.map(p => 
    `- Proyecto: ${p.name} (Estado: ${p.status}, Progreso: ${p.progress}%)`
  ).join('\n');

  const prompt = `
    Actúa como un Director de Proyectos (PMO). Genera el contenido para el Informe de Revisión Mensual: ${month}.
    
    DATOS:
    ${projectSummaries}
    
    ACTIVIDAD:
    - Completadas: ${completedTasks || 'Ninguna'}
    - Riesgos: ${activeRisks || 'Ninguno'}
    
    Responde SOLO con este JSON:
    {
      "summary": "Resumen ejecutivo.",
      "achievements": "Logros clave.",
      "issues": "Problemas y riesgos.",
      "nextSteps": "Recomendaciones."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);

  } catch (error) {
    console.error("Error:", error);
    return {
        summary: "Error: No se pudo conectar con la IA.",
        achievements: "Verifica que tienes la API KEY configurada.",
        issues: "Error de conexión o cuota excedida.",
        nextSteps: ""
    };
  }
};