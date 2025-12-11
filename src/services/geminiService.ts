import { GoogleGenerativeAI } from "@google/generative-ai";
import { Risk, Project, Task } from "../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || '');

export const generateMonthlyReview = async (
  month: string,
  projects: Project[],
  tasks: Task[],
  risks: Risk[]
): Promise<{ summary: string; achievements: string; issues: string; nextSteps: string }> => {
  
  const completedTasks = tasks.filter(t => t.status === 'Completed').map(t => t.title).join(', ');
  const delayedTasks = tasks.filter(t => t.status === 'Delayed').map(t => t.title).join(', ');
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
    - Retrasadas: ${delayedTasks || 'Ninguna'}
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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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