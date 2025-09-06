import ChatInterface from "../components/ChatInterface";

export default function AIPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI Sohbet Asistanı
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Groq&apos;un güçlü Llama 3.3 70B modeli ile desteklenen AI asistanımız, 
          sorularınıza anında yanıt verir ve size yardımcı olur.
        </p>
      </div>
      
      <ChatInterface />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Bu sohbet arayüzü Groq API kullanılarak oluşturulmuştur.</p>
        <p>Model: Llama 3.3 70B Versatile</p>
      </div>
    </div>
  );
}