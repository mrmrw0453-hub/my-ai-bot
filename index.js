const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(express.json());

// بدلاً من وضع المفتاح نصياً، نطلبه من النظام
const API_KEY = process.env.GEMINI_API_KEY; 
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
         ودود جدا جدا يحب ان يتكلم ليس شجعا و يعلم انه يتم التحدث معه من داخل روبلكس يحاول المساعده يجب أن تكون إجاباتك قصيرة جداً وغير مفصلة (مختصرة).
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
