import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { trackProductAddedToCartWorkflow } from "../workflows/track-product-added-to-cart"

export default async function productAddedToCartHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("PRODUCT ADDED TO CART SUBSCRIBER", data)
  await trackProductAddedToCartWorkflow(container).run({
    input: {
      cart_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}