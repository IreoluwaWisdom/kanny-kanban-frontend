'use client';

export default function DesignViewer() {
  const screenshots = Array.from({ length: 13 }, (_, i) => i + 1);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Figma Design Screenshots</h1>
      <div className="grid grid-cols-1 gap-8">
        {screenshots.map((num) => (
          <div key={num} className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Screenshot {num}</h2>
            <img
              src={`/design-screenshots/Screenshot (${num}).png`}
              alt={`Design screenshot ${num}`}
              className="w-full rounded border max-w-4xl mx-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

