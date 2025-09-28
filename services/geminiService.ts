import { GoogleGenAI, Type, Chat } from "@google/genai";
import { CharacterAnalysisData } from '../types';

const CHUNK_SIZE = 1_000_000; // 1M chars is safe for context window and request size limits.

function chunkText(text: string, chunkSize: number = CHUNK_SIZE): string[] {
    const chunks: string[] = [];
    if (text.length <= chunkSize) {
        return [text];
    }
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
}


const getOutlineInstructions = (): string => `
Bạn là một chuyên gia phân tích văn học. Nhiệm vụ của bạn là phân tích văn bản tiểu thuyết đã được cung cấp và tạo ra một đề cương toàn diện, có cấu trúc. Đề cương phải được định dạng bằng Markdown.

Đề cương phải bao gồm các phần sau, bắt đầu mỗi phần chính xác như được viết dưới đây (ví dụ: "1. **Tổng Quan Cốt Truyện:**"):

1.  **Tổng Quan Cốt Truyện:** Một đoạn tóm tắt ngắn gọn về toàn bộ cốt truyện.
2.  **Nhân Vật Chính:** Danh sách các nhân vật chính kèm theo mô tả ngắn về vai trò và sự phát triển của họ.
3.  **Chủ Đề:** Danh sách các chủ đề trung tâm được khám phá trong tiểu thuyết.
4.  **Cấu Trúc Truyện:** Phân tích cấu trúc của tiểu thuyết, được chia thành:
    *   **Mở Đầu:** Phần giới thiệu nhân vật và bối cảnh.
    *   **Diễn Biến:** Chuỗi sự kiện xây dựng căng thẳng và dẫn đến cao trào.
    *   **Cao Trào:** Bước ngoặt của câu chuyện.
    *   **Hạ Màn:** Các sự kiện xảy ra sau cao trào, dẫn đến giải pháp.
    *   **Kết Cục:** Phần kết của câu chuyện.
5.  **Phân Tích Chi Tiết Từng Chương (hoặc Phần):** Phân tích chi tiết các sự kiện quan trọng, các điểm cốt truyện và sự phát triển của nhân vật trong mỗi chương hoặc phần quan trọng của tiểu thuyết. Sử dụng tiêu đề cho mỗi chương/phần.

Bây giờ, hãy tạo đề cương dựa trên TOÀN BỘ văn bản đã được cung cấp trong các phần trước.
`;

export const generateOutlineChatStream = async (
  novelText: string,
  apiKey: string,
  model: string,
  onStream: (chunk: string) => void
): Promise<void> => {
  if (!apiKey) {
    throw new Error("API Key bị thiếu. Vui lòng nhập API Key trong phần Cài Đặt.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat: Chat = ai.chats.create({ model });

    const chunks = chunkText(novelText);
    
    if (chunks.length > 1) {
        // Send all but the last chunk
        for (let i = 0; i < chunks.length - 1; i++) {
            await chat.sendMessage({ message: `Đây là phần ${i + 1}/${chunks.length} của văn bản:\n\n${chunks[i]}` });
        }
    }
    
    // Send the last chunk along with the final prompt and stream the response.
    const lastChunk = chunks[chunks.length - 1];
    const finalPrompt = chunks.length > 1
        ? `Đây là phần cuối cùng ${chunks.length}/${chunks.length} của văn bản:\n\n${lastChunk}\n\n---\n\n${getOutlineInstructions()}`
        : `${lastChunk}\n\n---\n\n${getOutlineInstructions()}`;

    const response = await chat.sendMessageStream({ message: finalPrompt });

    for await (const chunk of response) {
      onStream(chunk.text);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại trong phần Cài Đặt.");
    }
    throw new Error("Quá trình phân tích gặp lỗi. Vui lòng thử lại. Nếu sự cố vẫn tiếp diễn, hãy kiểm tra API Key và kết nối mạng của bạn.");
  }
};

const getCharacterAnalysisInstructions = (): string => `
Bạn là một nhà phê bình văn học chuyên sâu. Nhiệm vụ của bạn là đọc kỹ tiểu thuyết được cung cấp qua các phần và thực hiện một phân tích nhân vật chi tiết.

Chỉ tập trung vào 3-5 nhân vật quan trọng nhất.

Đối với mỗi nhân vật, hãy cung cấp thông tin sau:
- Tên nhân vật.
- Mô tả ngắn gọn về ngoại hình, tính cách và hoàn cảnh.
- Vai trò của họ trong câu chuyện (ví dụ: Nhân vật chính, Nhân vật phản diện, Nhân vật phụ).
- Hành trình phát triển nhân vật (Character Arc): Họ đã thay đổi như thế nào từ đầu, giữa, và cuối câu chuyện?
- Các mối quan hệ quan trọng với các nhân vật khác.
- Một vài câu thoại tiêu biểu thể hiện rõ nhất tính cách của họ.

Vui lòng trả về kết quả dưới dạng một mảng JSON tuân thủ schema được cung cấp, dựa trên TOÀN BỘ văn bản.
`;

const characterAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'Tên đầy đủ của nhân vật.' },
            description: { type: Type.STRING, description: 'Mô tả ngắn gọn về ngoại hình, tính cách và hoàn cảnh của nhân vật.' },
            role: { type: Type.STRING, enum: ['Nhân vật chính', 'Nhân vật phụ', 'Nhân vật phản diện', 'Khác'], description: 'Vai trò của nhân vật trong câu chuyện.' },
            arc: {
                type: Type.OBJECT,
                properties: {
                    beginning: { type: Type.STRING, description: 'Mô tả trạng thái và mục tiêu của nhân vật ở đầu câu chuyện.' },
                    middle: { type: Type.STRING, description: 'Mô tả những thử thách và thay đổi của nhân vật ở giữa câu chuyện.' },
                    end: { type: Type.STRING, description: 'Mô tả trạng thái cuối cùng và sự thay đổi của nhân vật ở cuối câu chuyện.' },
                },
                required: ['beginning', 'middle', 'end'],
            },
            relationships: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        characterName: { type: Type.STRING, description: 'Tên của nhân vật khác có mối quan hệ.' },
                        relationship: { type: Type.STRING, description: 'Mô tả bản chất của mối quan hệ (ví dụ: đồng minh, kẻ thù, người yêu, gia đình).' },
                    },
                    required: ['characterName', 'relationship'],
                },
            },
            keyQuotes: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                },
                description: 'Một vài câu trích dẫn tiêu biểu của nhân vật.',
            },
        },
        required: ['name', 'description', 'role', 'arc', 'relationships', 'keyQuotes'],
    },
};

export const generateCharacterAnalysisChat = async (
  novelText: string,
  apiKey: string,
  model: string,
): Promise<CharacterAnalysisData> => {
    if (!apiKey) {
        throw new Error("API Key bị thiếu. Vui lòng nhập API Key trong phần Cài Đặt.");
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        const chat: Chat = ai.chats.create({ model });

        const chunks = chunkText(novelText);

        if (chunks.length > 1) {
            for (let i = 0; i < chunks.length - 1; i++) {
                await chat.sendMessage({ message: `Đây là phần ${i + 1}/${chunks.length} của văn bản:\n\n${chunks[i]}` });
            }
        }
        
        const lastChunk = chunks[chunks.length - 1];
        const finalPrompt = chunks.length > 1
            ? `Đây là phần cuối cùng ${chunks.length}/${chunks.length} của văn bản:\n\n${lastChunk}\n\n---\n\n${getCharacterAnalysisInstructions()}`
            : `${lastChunk}\n\n---\n\n${getCharacterAnalysisInstructions()}`;

        const response = await chat.sendMessage({
            message: finalPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: characterAnalysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as CharacterAnalysisData;

    } catch (error) {
        console.error("Error calling Gemini API for character analysis:", error);
         if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại trong phần Cài Đặt.");
        }
        if (error instanceof SyntaxError) {
             throw new Error("AI đã trả về một định dạng không hợp lệ. Vui lòng thử lại.");
        }
        throw new Error("Quá trình phân tích nhân vật gặp lỗi. Vui lòng thử lại. Nếu sự cố vẫn tiếp diễn, hãy kiểm tra API Key và model được chọn.");
    }
};