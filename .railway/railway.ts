import { defineRailway, project, service, database } from "railway/iac";

export default defineRailway(() => {
  const postgres = database("Postgres");

  const api = service("digital-wallet-api", {
    build: {
      builder: "dockerfile",
    },
    healthcheck: "/health",
    variables: {
      DATABASE_URL: postgres.databaseUrl,
      NODE_ENV: "production",
    },
  });

  return project("digital-wallet-api", {
    resources: [postgres, api],
  });
});
