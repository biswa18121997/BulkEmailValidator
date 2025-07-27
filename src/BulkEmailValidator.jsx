import React, { useState } from "react";

const API_KEY = import.meta.env.VITE_API_KEY_KICKBOX;

export default function EmailVerifier() {
  const [emailInput, setEmailInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const verifyEmails = async () => {
    setLoading(true);

    const emails = emailInput
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    const output = [];

    for (const email of emails) {
      try {
        const res = await fetch(
          `https://api.kickbox.com/v2/verify?email=${email}&apikey=${API_KEY}`
        );
        const data = await res.json();
        console.log("Kickbox response:", data);
        output.push({
          email,
          smtpValid: data.result === "deliverable",
          isDeliverable: data.result === "deliverable",
          isDisposable: data.disposable === true,
        });
      } catch {
        console.log(output);
        output.push({ email, error: true });
      }
    }

    setResults(output);
    prepareFilteredDataAndSend(output);
    setLoading(false);
  };

  const prepareFilteredDataAndSend = async (output) => {
    const validResults = output.filter((r) => r.isDeliverable);
    if (validResults.length === 0) return;

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_API_BASE_URL,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ results: validResults }),
        }
      );

      const data = await response.json();
      console.log("Backend responded:", data);
    } catch (error) {
      console.error("Error sending valid emails to backend:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 border border-dashed border-gray-300 rounded">
        <label className="block mb-2 font-medium">Paste Emails (comma-separated)</label>
        <textarea
          rows="5"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="example1@gmail.com, example2@yahoo.com"
        />
      </div>

      {emailInput.trim().length > 0 && (
        <button
          onClick={verifyEmails}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Emails"}
        </button>
      )}

      {results.length > 0 && (
        <div className="border border-gray-200 shadow p-4 rounded">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Email</th>
                  <th>SMTP Valid</th>
                  <th>Deliverable</th>
                  <th>Disposable</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{r.email}</td>
                    <td>{r.smtpValid ? "✅" : "❌"}</td>
                    <td>{r.isDeliverable ? "Yes" : "No"}</td>
                    <td>{r.isDisposable ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
