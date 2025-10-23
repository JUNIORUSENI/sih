"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logger l'erreur globale dans la console
    console.error("Erreur globale de l'application:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg border border-slate-200">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold mb-2 text-slate-900">
                Erreur critique du système
              </h1>
              
              <p className="text-slate-600 mb-6">
                Une erreur grave s'est produite. Veuillez réessayer ou contacter l'administrateur système.
              </p>

              {process.env.NODE_ENV === "development" && (
                <div className="rounded-lg bg-slate-100 p-4 mb-6 text-left">
                  <p className="text-sm font-mono text-red-600 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-slate-500 mt-2">
                      ID d'erreur: {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                        Voir la stack trace
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-40 bg-slate-50 p-2 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={reset}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Réessayer
                </button>
                
                <button
                  onClick={() => window.location.href = "/"}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>

              <p className="text-xs text-center text-slate-500 mt-4">
                Si le problème persiste, veuillez noter l'ID d'erreur et contacter le support technique.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}