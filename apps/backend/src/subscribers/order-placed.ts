import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
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
}

export const config: SubscriberConfig = {
  event: "order.placed",
}