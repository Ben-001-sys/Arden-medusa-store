import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

import { Modules } from "@medusajs/framework/utils"

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

  const notificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  try {
    await notificationModuleService.createNotifications({
      to: "ardenstudio001@gmail.com",
      channel: "email",
      template: "d-8ecb0768bd68462ca73661c29e73e6e4",
      data: {
        cart_id: data.id,
      },
    })

    console.log("CART EMAIL NOTIFICATION CREATED")
  } catch (error) {
    console.error("SENDGRID ERROR", error)
  }
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}