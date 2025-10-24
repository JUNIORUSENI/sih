"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  type?: "error" | "warning" | "info";
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ 
  title, 
  message, 
  type = "error", 
  onRetry,
  onDismiss 
}: ErrorDisplayProps) {
  const icons = {
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };

  const colors = {
    error: "border-red-500 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100",
    warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100",
    info: "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100"
  };

  return (
    <Alert className={`${colors[type]} border-2`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          {title && <AlertTitle className="mb-1 font-semibold">{title}</AlertTitle>}
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onRetry}
                  className="text-xs"
                >
                  Réessayer
                </Button>
              )}
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onDismiss}
                  className="text-xs"
                >
                  Fermer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}