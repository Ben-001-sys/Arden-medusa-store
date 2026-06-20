import { createWorkflow } from "@medusajs/framework/workflows-sdk";
import { createStep } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";

type StepInput = {
  cart: any;
};

const trackProductAddedToCartStep = createStep(
  "track-product-added-to-cart-step",
  async ({ cart }: StepInput, { container }) => {
    if (!cart?.items?.length) {
      return;
    }

    console.log("TRACKING PRODUCT ADDED TO CART", cart.id);
    const analyticsModuleService = container.resolve(Modules.ANALYTICS);

    await analyticsModuleService.track({
      event: "product_added_to_cart",
      actor_id: cart.customer_id || cart.id,
      properties: {
        cart_id: cart.id,
        total: cart.total,
        items: cart.items.map((item: any) => ({
          variant_id: item.variant_id,
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        ...(cart.customer_id ? { customer_id: cart.customer_id } : {}),
      },
    });
  },
);

type WorkflowInput = {
  cart_id: string;
};

export const trackProductAddedToCartWorkflow = createWorkflow(
  "track-product-added-to-cart-workflow",
  ({ cart_id }: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "customer.*", "items.*"],
      filters: {
        id: cart_id,
      },
    });
    trackProductAddedToCartStep({
      cart: carts[0],
    } as unknown as StepInput);
  },
);
