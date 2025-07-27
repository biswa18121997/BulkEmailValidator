import React, { useState } from "react";

const API_KEY = import.meta.env.VITE_API_KEY_KICKBOX;

export default function EmailVerifier() {
  const [emailInput, setEmailInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

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
      setResponse(data.failedList. data.successList);
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

      <h2 className="text-xl font-semibold mb-4">E-Mail Verification Results</h2>

      {results.length > 0 && (
  <div className="grid grid-cols-1 gap-2 justify-center items-center mt-6">
    <div className="flex justify-around items-center bg-gray-100 p-4 rounded-lg shadow-sm">
      <p className="text-gray-600">
        {results.length} email(s) processed.
      </p>
      <p className="text-gray-600">
        {results.filter(r => r.smtpValid).length} SMTP valid email(s).
      </p>
      <p className="text-gray-600">
        {results.filter(r => r.isDeliverable).length} deliverable email(s).
      </p>
      <p className="text-gray-600">
        {results.filter(r => r.isDisposable).length} disposable email(s).
      </p>
     
    </div>
    {results.map((r, i) => (
      <div
        key={i}
className={`${
  r.isDeliverable ? "text-black bg-green-400" : "bg-red-400 text-black"
} p-4 border rounded-lg shadow-sm space-y-2 flex justify-around items-center`}      >
        <p className="font-medium text-gray-800">
          📧 {r.email}
        </p>
        <p>
          SMTP Valid:{" "}
          <span className={r.smtpValid ? "text-green-600" : "text-red-600"}>
            {r.smtpValid ? "✅ Yes" : "❌ No"}
          </span>
        </p>
        <p>
          Deliverable:{" "}
          <span className={r.isDeliverable ? "text-black bg-green-400" : "bg-red-400 text-black"}>
            {r.isDeliverable ? "Yes" : "No"}
          </span>
        </p>
        <p>
          Disposable:{" "}
          <span className={r.isDisposable ? "text-orange-600" : "text-gray-600"}>
            {r.isDisposable ? "Yes" : "No"}
          </span>
        </p>
        {r.error && (
          <p className="text-red-500">❗ Error verifying this email</p>
        )}
      </div>
    ))}
  </div>
)}

<hr />

<div>
  <h1>Email Sending Results : </h1>
  {response ? (
    <div>
      <h2>Successful Emails:</h2>
      <ul className="list-disc pl-5 bg-green-400"> 
        {response.successful.map((email, index) => (
          <li key={index} className="text-green-600">{email}</li>
        ))}
      </ul>
      <h2>Failed Emails:</h2>
      <ul className="list-disc pl-5 bg-green-400">
        {response.failedList.map((item, index) => (
          <li key={index} className="text-red-600">
            {item.email}: {item.error}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <p>No email sending results yet.</p>
  )}

</div>
</div>
  );
}
