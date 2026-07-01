export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { gatewayManager } = await import("./lib/gateway")
    await gatewayManager.start()
  }
}
