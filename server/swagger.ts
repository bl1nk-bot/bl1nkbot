import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

/**
 * Load OpenAPI specification from public folder
 */
export function getOpenAPISpec() {
  try {
    const specPath = path.join(process.cwd(), "public", "openapi.json");
    const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
    return spec;
  } catch (error) {
    console.error("Failed to load OpenAPI spec:", error);
    return null;
  }
}

/**
 * Setup Swagger UI middleware
 */
export function setupSwagger(app: any) {
  const spec = getOpenAPISpec();

  if (!spec) {
    console.warn("OpenAPI specification not found, skipping Swagger setup");
    return;
  }

  // Swagger UI options
  const options = {
    definition: spec,
    apis: [],
  };

  // Setup Swagger UI at /api/docs
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      swaggerOptions: {
        url: "/openapi.json",
        persistAuthorization: true,
        displayOperationId: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
      customCss: `
        .swagger-ui .topbar {
          background-color: #1f2937;
        }
        .swagger-ui .info .title {
          color: #1f2937;
        }
        .swagger-ui .btn.authorize {
          background-color: #3b82f6;
        }
        .swagger-ui .btn.authorize:hover {
          background-color: #2563eb;
        }
      `,
      customSiteTitle: "API Documentation",
    })
  );

  // Serve OpenAPI spec as JSON
  app.get("/openapi.json", (req: any, res: any) => {
    res.json(spec);
  });

  console.log("✓ Swagger UI setup at /api/docs");
}
