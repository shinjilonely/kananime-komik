import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function analyzeImages() {
  try {
    const zai = await ZAI.create();

    const image1Buffer = fs.readFileSync('/home/z/my-project/upload/Screenshot_2026-03-11-12-59-52-32_841560bf0517a9756538902c50ab3bd9.jpg');
    const image2Buffer = fs.readFileSync('/home/z/my-project/upload/Screenshot_2026-03-11-15-11-13-13_40deb401b9ffe8e1df2f1cc5ba480b12.jpg');
    
    const base64Image1 = image1Buffer.toString('base64');
    const base64Image2 = image2Buffer.toString('base64');

    const prompt = `Describe this comic reader app UI in detail. Focus on:
1) Color scheme (background, accent colors, text colors)
2) Header/toolbar design
3) Card layout and design
4) Navigation elements
5) Typography style
6) Overall visual style

Be specific about exact colors and design elements.`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image1}` } }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    console.log('=== IMAGE 1 ANALYSIS ===');
    console.log(response.choices[0]?.message?.content);
    
    const response2 = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image2}` } }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    console.log('\n=== IMAGE 2 ANALYSIS ===');
    console.log(response2.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeImages();
