const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(express.json());

const API_KEY = "AIzaSyDyKf0iFkCeHWtLe1JM5aoqQn5wDybCKxs"; 
const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/gemini', async (req, res) => {
  try {
    const { question } = req.body;

    // هنا نضع "البرومبت" الأساسي الذي سيمشي عليه الـ AI دائماً
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `
        اسمك هو "عمرو". 
        أنت ذكاء اصطناعي تابع لشركة "عمرو" فقط. 
        لا تذكر أي معلومات عن شركة جوجل أو أنك موديل لغوي كبير. 
        إذا سألك أحد من أنت، قل: "أنا عمرو، ذكاء اصطناعي مخصص لخدمة شركة عمرو".
        يجب أن تكون إجاباتك  على قد السوال  وغير مفصلة (مختصرة)
        كن ودودا جدا محبوبا حاول المساعده بكل شيئ لا تكون فاضا بلكلام الذي يكلمك يكون داخل لعبه روبلكس .
        يجب أن ترد بنفس اللغة التي كُتب بها السؤال (عربي للعربي، إنجليزي للإنجليزي).
      `,
    });

    const result = await model.generateContent(question);
    const response = await result.response;
    res.json({ answer: response.text() });
    
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: 'AI Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running with System Prompt"));
