import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
  authenticate,
  MedusaRequest, 
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";
import { PostInvoiceConfigSchema } from "./admin/invoice-config/route";
import { PostStoreReviewSchema } from "./store/reviews/route";
import { GetAdminReviewsSchema } from "./admin/reviews/route";
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route";
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route";
import { PostAdminCreateBrand } from "./admin/brands/validators";
import { z } from "@medusajs/framework/zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { Modules } from "@medusajs/framework/utils";


export const GetBrandsSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/invoice-config",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostInvoiceConfigSchema)],
    },
    {
      methods: ["POST"],
      matcher: "/store/reviews",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(PostStoreReviewSchema),
      ],
    },
    {
      matcher: "/admin/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/reviews/status",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminUpdateReviewsStatusSchema),
      ],
    },
    {
      matcher: "/store/products/:id/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "rating",
            "title",
            "first_name",
            "last_name",
            "content",
            "created_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/brands",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateBrand),
      ],
    },
    {
      matcher: "/admin/products",
      method: ["POST"],
      additionalDataValidator: {
        brand_id: z.string().optional(),
      },
    },
    {
      matcher: "/admin/brands",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetBrandsSchema,
          {
            defaults: [
              "id",
              "name",
              "products.*",
            ],
            isList: true,
          }
        ),
      ],
    },
    {
      matcher: "/webhooks/strapi",
      middlewares: [
        async (
          req: MedusaRequest,
          res: MedusaResponse,
          next: MedusaNextFunction
        ) => {
          const apiKeyModuleService = req.scope.resolve(
            Modules.API_KEY
          )
          
          // Extract Bearer token from Authorization header
          const authHeader = req.headers["authorization"]
          const apiKey = authHeader?.replace("Bearer ", "")
          
          if (!apiKey) {
            return res.status(401).json({
              message: "Unauthorized: Missing API key",
            })
          }
          
          try {
            // Validate the API key using Medusa's API Key Module
            const isValid = await apiKeyModuleService.authenticate(apiKey)
            
            if (!isValid) {
              return res.status(401).json({
                message: "Unauthorized: Invalid API key",
              })
            }
            
            // API key is valid, proceed to route handler
            next()
          } catch (error) {
            return res.status(401).json({
              message: "Unauthorized: API key authentication failed",
            })
          }
        },
      ],
    }
  ],
});
