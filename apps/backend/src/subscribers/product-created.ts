import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

import { Modules } from "@medusajs/framework/utils"

export default async function productCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("PRODUCT CREATED", data)

  const notificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  await notificationModuleService.createNotifications({
    to: "ardenstudio001@gmail.com",
    channel: "email",
    template: "d-8ecb0768bd68462ca73661c29e73e6e4",
    data: {
      product_id: data.id,
    },
  })

  console.log("EMAIL NOTIFICATION CREATED")
}

export const config: SubscriberConfig = {
  event: "product.created",
}