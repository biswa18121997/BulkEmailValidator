import React, { useState } from "react";
import Papa from "papaparse";
import { Inbox } from "lucide-react";

const API_KEY = "24d85f6549672836f6b7fe1d2e5a4ea7"; // Replace with your MailboxLayer API key

export default function EmailVerifier() {
  const [emails, setEmails] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (file.type === "application/json") {
        try {
          const jsonData = JSON.parse(event.target.result);
          const emailList = jsonData.map((item) => item.email);
          setEmails(emailList);
        } catch (err) {
          alert("Invalid JSON file format.");
        }
      } else {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const emailList = results.data.map((row) => row.email).filter(Boolean);
            setEmails(emailList);
          },
        });
      }
    };
    reader.readAsText(file);
  };

  const verifyEmails = async () => {
    setLoading(true);
    const output = [];

    for (const email of emails) {
      try {
        const res = await fetch(
          `https://apilayer.net/api/check?access_key=${API_KEY}&email=${email}&smtp=1&format=1`
        );
        const data = await res.json();
        output.push({
          email,
          smtpValid: data.smtp_check || false,
          isDeliverable: data.format_valid && data.mx_found && data.smtp_check,
          isDisposable: data.disposable || false,
        });
      } catch {
        output.push({ email, error: true });
      }
    }
    console.log(output);

    setResults(output);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 flex flex-col items-center justify-center border-dashed border-2 border-gray-300">
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileUpload}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer text-center">
          <Inbox className="mx-auto mb-2" size={48} />
          <p className="text-gray-600">Drag and drop or click to upload CSV or JSON</p>
        </label>
      </div>

      {emails.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Found {emails.length} emails to verify.</p>
          <button
            onClick={verifyEmails}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Emails"}
          </button>
        </div>
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
