import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export function WaitlistedTemplate({ firstName }: EmailTemplateProps) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
    </div>
  );
}
