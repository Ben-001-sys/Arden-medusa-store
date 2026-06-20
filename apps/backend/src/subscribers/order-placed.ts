import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

import { Modules } from "@medusajs/framework/utils"

import { trackOrderPlacedWorkflow } from "../workflows/track-order-placed"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("ORDER PLACED SUBSCRIBER", data)

  await trackOrderPlacedWorkflow(container).run({
    input: {
      order_id: data.id,
    },
  })

  const notificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  await notificationModuleService.createNotifications({
    to: "ardenstudio001@gmail.com",
    channel: "email",
    template: "d-8ecb0768bd68462ca73661c29e73e6e4",
    data: {
      order_id: data.id,
    },
  })

  console.log("ORDER EMAIL NOTIFICATION CREATED")
}

export const config: SubscriberConfig = {
  event: "order.placed",
}