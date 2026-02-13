const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(express.json());

// ⚠️ مهم: ضع مفتاح API صحيح هنا
const API_KEY = "AIzaSyDyKf0iFkCeHWtLe1JM5aoqQn5wDybCKxs"; // هذا المفتاح يبدو صحيحاً من الكود السابق
const genAI = new GoogleGenerativeAI(API_KEY);

// دالة لاختبار المفتاح أولاً
async function testApiKey() {
    try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const test = await fetch(testUrl);
        const data = await test.json();
        
        if (data.error) {
            console.error("❌ المفتاح غير صالح:", data.error.message);
            return false;
        } else {
            console.log("✅ المفتاح صالح! النماذج المتاحة:");
            data.models.forEach(model => {
                console.log(`   • ${model.name}`);
            });
            return true;
        }
    } catch (e) {
        console.error("❌ فشل اختبار المفتاح:", e.message);
        return false;
    }
}

app.get('/', async (req, res) => {
    const isValid = await testApiKey();
    if (isValid) {
        res.send(`
            <html dir="rtl">
            <head><title>Gemini Server</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: green;">✅ السيرفر يعمل!</h1>
                <p>المفتاح صالح وجاهز لاستقبال الرسائل</p>
                <p>استخدم POST /gemini مع JSON: {"question": "سؤالك هنا"}</p>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <html dir="rtl">
            <head><title>Gemini Server</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ خطأ في المفتاح</h1>
                <p>المفتاح الحالي غير صالح. يرجى تحديثه في الكود.</p>
            </body>
            </html>
        `);
    }
});

app.post('/gemini', async (req, res) => {
    try {
        const { question } = req.body;
        
        // التحقق من وجود السؤال
        if (!question) {
            return res.status(400).json({ 
                error: 'السؤال مطلوب', 
                details: 'يرجى إرسال حقل question في الطلب'
            });
        }
        
        // التحقق من المفتاح
        if (!API_KEY || API_KEY === "ضع_المفتاح_الجديد_هنا") {
            return res.status(500).json({ 
                error: 'API Key Missing', 
                details: 'يرجى وضع مفتاح API صحيح في الكود'
            });
        }
        
        console.log(`📨 سؤال: ${question.substring(0, 50)}...`);
        
        // استخدام النموذج الصحيح
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(question);
        const answer = result.response.text();
        
        console.log(`📤 رد: ${answer.substring(0, 50)}...`);
        
        res.json({ 
            success: true,
            answer: answer 
        });
        
    } catch (e) {
        console.error('❌ خطأ مفصل:', e);
        
        // تحديد نوع الخطأ بدقة
        let errorMessage = e.message;
        let statusCode = 500;
        
        if (errorMessage.includes("API key")) {
            errorMessage = "مفتاح API غير صالح. يرجى الحصول على مفتاح جديد من Google AI Studio";
            statusCode = 401;
        } else if (errorMessage.includes("model")) {
            errorMessage = "النموذج المطلوب غير متوفر. تأكد من استخدام gemini-1.5-flash";
        } else if (errorMessage.includes("quota")) {
            errorMessage = "تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً";
            statusCode = 429;
        }
        
        res.status(statusCode).json({ 
            error: 'AI Error', 
            details: errorMessage
        });
    }
});

// إضافة route للتحقق من الصحة
app.get('/health', (req, res) => {
    res.json({
        status: '✅正常运行',
        timestamp: new Date().toISOString(),
        api_key_configured: API_KEY !== "ضع_المفتاح_الجديد_هنا",
        model: 'gemini-1.5-flash'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Running on port ${PORT}`);
    console.log(`📝 اختبار المفتاح...`);
    testApiKey().then(isValid => {
        if (isValid) {
            console.log(`✅ السيرفر جاهز للاستخدام!`);
        } else {
            console.log(`❌ السيرفر يعمل لكن المفتاح غير صالح`);
        }
    });
});
