import { config } from "dotenv"
import { resolve } from "path"
import { eq } from "drizzle-orm"
import { getDatabaseClient } from "./client"
import { user, workspaces, agents, channels, conversations, messages } from "./schemas"

config({ path: resolve(process.cwd(), "../../apps/web/.env") })

const NVIDIA_API_KEY =
  process.env.NVIDIA_API_KEY ??
  "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"

const SUDO_COMPANY = {
  name: "Sudo Inc",
  slug: "sudo-inc",
  description: "Enterprise developer tools and cloud infrastructure",
}

const AGENTS = [
  {
    name: "Support Bot",
    description: "General customer support for Sudo Inc products",
    systemPrompt: `You are a support agent for Sudo Inc, an enterprise developer tools company.
Our products include:
- Sudo Cloud: Managed cloud infrastructure for developers ($49/mo starter, $199/mo pro, custom enterprise)
- Sudo Auth: Authentication and authorization service ($29/mo up to 10k users, $99/mo up to 100k users)
- Sudo Deploy: CI/CD and deployment automation ($39/mo)
- Sudo Monitor: Application monitoring and alerting ($59/mo)

Business hours: Mon-Fri 9am-6pm EST
Support email: support@sudoinc.dev
Status page: status.sudoinc.dev

Always be helpful, professional, and concise.`,
    providerConfig: {
      type: "openai" as const,
      model: "poolside/laguna-xs-2.1",
      baseUrl: "https://integrate.api.nvidia.com/v1",
      apiKey: NVIDIA_API_KEY,
      temperature: 0.7,
      maxTokens: 1024,
      contentSafety: {
        enabled: true,
        checkInput: false,
        checkResponse: true,
      },
    },
  },
  {
    name: "Sales Assistant",
    description: "Handles sales inquiries and enterprise deals",
    systemPrompt: `You are a sales representative for Sudo Inc.
Help potential customers understand our pricing and find the right plan.
Key pricing:
- Sudo Cloud: Starter $49/mo, Pro $199/mo, Enterprise custom
- Sudo Auth: $29/mo (10k users), $99/mo (100k users), Enterprise custom
- Sudo Deploy: $39/mo
- Sudo Monitor: $59/mo
- Bundle: All 4 products for $299/mo (save $72/mo)

For enterprise deals, schedule a call: sales@sudoinc.dev
Free 14-day trial available for all products.`,
    providerConfig: {
      type: "openai" as const,
      model: "poolside/laguna-xs-2.1",
      baseUrl: "https://integrate.api.nvidia.com/v1",
      apiKey: NVIDIA_API_KEY,
      temperature: 0.5,
      maxTokens: 1024,
      contentSafety: {
        enabled: true,
        checkInput: false,
        checkResponse: true,
      },
    },
  },
]

const CONVERSATIONS = [
  {
    agentIndex: 0,
    status: "resolved" as const,
    isTest: false,
    externalUserId: "user-001",
    messages: [
      {
        role: "user" as const,
        content: "Hi, I need help with my Sudo Cloud deployment. It's been down for 20 minutes.",
      },
      {
        role: "assistant" as const,
        content:
          "I'm sorry to hear about the downtime. Let me check our status page — it shows all systems operational for Sudo Cloud. Can you share your project ID or the region you're deployed in? This will help me investigate further.",
      },
      { role: "user" as const, content: "Project ID is sudo-cloud-abc123, region us-east-1." },
      {
        role: "assistant" as const,
        content:
          "Thank you. I can see your instance in us-east-1. There was a brief network disruption at 14:32 UTC that lasted ~3 minutes. Your instance should be back online now. I'd recommend checking your logs — if issues persist, we can escalate to our infrastructure team. Would you like me to open a support ticket?",
      },
      { role: "user" as const, content: "It's back up now. Thanks for the quick help!" },
      {
        role: "assistant" as const,
        content:
          "Great to hear! For future reference, you can monitor real-time status at status.sudoinc.dev. Don't hesitate to reach out if you need anything else.",
      },
    ],
  },
  {
    agentIndex: 0,
    status: "resolved" as const,
    isTest: false,
    externalUserId: "user-002",
    messages: [
      { role: "user" as const, content: "How do I set up Sudo Auth with my Next.js app?" },
      {
        role: "assistant" as const,
        content:
          "Here's how to integrate Sudo Auth with Next.js:\n\n1. Install the SDK: \`npm install @sudo/auth-sdk\`\n2. Add your API key to .env.local: \`SUDO_AUTH_KEY=your_key\`\n3. Wrap your app with the provider:\n\`\`\`tsx\nimport { SudoAuthProvider } from '@sudo/auth-sdk'\n\nexport default function Layout({ children }) {\n  return <SudoAuthProvider>{children}</SudoAuthProvider>\n}\n\`\`\`\n\nOur docs at docs.sudoinc.dev/auth have detailed guides. Need help with a specific part?",
      },
      { role: "user" as const, content: "What about social login providers?" },
      {
        role: "assistant" as const,
        content:
          "Sudo Auth supports Google, GitHub, Microsoft, and Apple out of the box. Enable them in your dashboard under Settings > Auth Providers. Each requires OAuth credentials from the provider — our docs walk you through obtaining those.",
      },
    ],
  },
  {
    agentIndex: 0,
    status: "active" as const,
    isTest: false,
    externalUserId: "user-003",
    messages: [
      {
        role: "user" as const,
        content: "I'm getting rate limited on my API calls. Is there a way to increase the limit?",
      },
      {
        role: "assistant" as const,
        content:
          "Rate limits depend on your plan. Starter: 100 req/min, Pro: 1000 req/min, Enterprise: custom. Which plan are you on? I can check your current usage.",
      },
      {
        role: "user" as const,
        content: "I'm on the Pro plan but hitting 1000 req/min consistently.",
      },
      {
        role: "assistant" as const,
        content:
          "For consistent high-volume usage, we recommend our Enterprise plan which offers custom rate limits, dedicated support, and SLA guarantees. Would you like me to connect you with our sales team, or would you prefer to optimize your current usage patterns first?",
      },
    ],
  },
  {
    agentIndex: 0,
    status: "resolved" as const,
    isTest: true,
    externalUserId: "test-user-001",
    messages: [
      { role: "user" as const, content: "This is a test conversation for analytics verification." },
      {
        role: "assistant" as const,
        content: "Acknowledged. This test conversation will be excluded from analytics queries.",
      },
    ],
  },
  {
    agentIndex: 1,
    status: "resolved" as const,
    isTest: false,
    externalUserId: "user-004",
    messages: [
      {
        role: "user" as const,
        content:
          "I'm evaluating Sudo Cloud vs AWS Lambda for our startup. What are the key differences?",
      },
      {
        role: "assistant" as const,
        content:
          "Great question! Here's a quick comparison:\n\n**Sudo Cloud advantages:**\n- Predictable pricing (no surprise bills)\n- Built-in CI/CD with Sudo Deploy\n- Integrated monitoring with Sudo Monitor\n- Simpler developer experience\n- 14-day free trial\n\n**When AWS Lambda might be better:**\n- You need deep AWS ecosystem integration\n- Very high scale (millions of requests)\n- Existing AWS infrastructure\n\nFor most startups, Sudo Cloud offers better value and faster time-to-market. Want to start a free trial?",
      },
      { role: "user" as const, content: "What's included in the free trial?" },
      {
        role: "assistant" as const,
        content:
          "The 14-day trial includes full access to Sudo Cloud Pro tier features — no credit card required. You get:\n- Unlimited deployments\n- 100k compute minutes\n- 10GB storage\n- Full monitoring and alerting\n- Email support\n\nReady to get started? I can send you the signup link.",
      },
    ],
  },
  {
    agentIndex: 1,
    status: "active" as const,
    isTest: false,
    externalUserId: "user-005",
    messages: [
      {
        role: "user" as const,
        content: "We're a team of 50 developers. What's the best bundle deal?",
      },
      {
        role: "assistant" as const,
        content:
          "For a team of 50, I'd recommend our **Enterprise Bundle** at $299/mo (normally $371/mo):\n\n- Sudo Cloud Pro (unlimited deployments)\n- Sudo Auth (up to 100k users)\n- Sudo Deploy (unlimited pipelines)\n- Sudo Monitor (advanced alerting)\n\nPlus you get:\n- SSO/SAML integration\n- Priority support (4hr response SLA)\n- Dedicated account manager\n- Custom onboarding session\n\nShall I set up a call with our enterprise team to discuss your specific needs?",
      },
    ],
  },
]

async function seedTestConversations() {
  const db = getDatabaseClient()

  console.log("=== Seeding Sudo Inc test data ===\n")

  const existingUser = await db.select().from(user).limit(1)
  if (existingUser.length === 0) {
    console.log("No user found. Run the main seed first (pnpm db:seed)")
    process.exit(1)
  }

  const existingWorkspace = await db.select().from(workspaces).limit(1)
  if (existingWorkspace.length === 0) {
    console.log("No workspace found. Run the main seed first (pnpm db:seed)")
    process.exit(1)
  }

  const ws = existingWorkspace[0]!
  console.log(`Using workspace: ${ws.name} (${ws.id})`)

  const existingAgents = await db.select().from(agents).where(eq(agents.workspaceId, ws.id))

  let supportAgent = existingAgents.find((a) => a.name === "Support Bot")
  let salesAgent = existingAgents.find((a) => a.name === "Sales Assistant")

  if (!supportAgent) {
    const [created] = await db
      .insert(agents)
      .values({
        workspaceId: ws.id,
        ...AGENTS[0]!,
      })
      .returning()
    supportAgent = created
    console.log(`Created agent: ${supportAgent!.name}`)
  } else {
    console.log(`Using existing agent: ${supportAgent.name}`)
  }

  if (!salesAgent) {
    const [created] = await db
      .insert(agents)
      .values({
        workspaceId: ws.id,
        ...AGENTS[1]!,
      })
      .returning()
    salesAgent = created
    console.log(`Created agent: ${salesAgent!.name}`)
  } else {
    console.log(`Using existing agent: ${salesAgent.name}`)
  }

  const agentInstances = [supportAgent!, salesAgent!]

  const existingChannels = await db
    .select()
    .from(channels)
    .where(eq(channels.agentId, supportAgent!.id))

  if (existingChannels.length === 0) {
    await db.insert(channels).values([
      {
        agentId: supportAgent!.id,
        type: "widget",
        name: "Website Widget",
        isActive: "true",
        config: {
          title: "Sudo Inc Support",
          greeting: "Hi! How can we help you with Sudo products today?",
          color: "#6366f1",
          agentName: "Support Bot",
        },
      },
      {
        agentId: salesAgent!.id,
        type: "widget",
        name: "Sales Widget",
        isActive: "true",
        config: {
          title: "Sudo Inc Sales",
          greeting: "Interested in Sudo Inc? Let's find the right plan for you!",
          color: "#10b981",
          agentName: "Sales Assistant",
        },
      },
    ])
    console.log("Created 2 widget channels")
  }

  let conversationsCreated = 0
  let messagesCreated = 0

  for (const convData of CONVERSATIONS) {
    const agent = agentInstances[convData.agentIndex]!

    const channelType = convData.agentIndex === 0 ? "widget" : "widget"
    const channelList = await db.select().from(channels).where(eq(channels.agentId, agent.id))
    const channel = channelList.find((c) => c.type === channelType) ?? channelList[0]

    if (!channel) {
      console.log(`No channel for agent ${agent.name}, skipping`)
      continue
    }

    const now = new Date()
    const minutesAgo = Math.floor(Math.random() * 1440)
    const conversationDate = new Date(now.getTime() - minutesAgo * 60 * 1000)

    const [conversation] = await db
      .insert(conversations)
      .values({
        channelId: channel.id,
        externalUserId: convData.externalUserId,
        status: convData.status,
        isTest: convData.isTest,
        metadata: {
          company: SUDO_COMPANY.name,
          source: convData.isTest ? "test-seed" : "seed",
        },
        messageCount: convData.messages.length,
        createdAt: conversationDate,
        updatedAt: new Date(conversationDate.getTime() + convData.messages.length * 60000),
      })
      .returning()

    conversationsCreated++

    if (!conversation) {
      console.log("Failed to create conversation, skipping")
      continue
    }

    for (let i = 0; i < convData.messages.length; i++) {
      const msg = convData.messages[i]!
      const msgTime = new Date(conversationDate.getTime() + i * 60000)

      await db.insert(messages).values({
        conversationId: conversation.id,
        role: msg.role,
        content: msg.content,
        tokensIn: msg.role === "user" ? Math.floor(Math.random() * 50) + 10 : undefined,
        tokensOut: msg.role === "assistant" ? Math.floor(Math.random() * 150) + 30 : undefined,
        createdAt: msgTime,
      })

      messagesCreated++
    }

    const label = convData.isTest ? " [TEST]" : ""
    console.log(
      `Created conversation: ${convData.status}${label} (${convData.messages.length} messages)`,
    )
  }

  console.log(`\n=== Seed complete ===`)
  console.log(`Conversations: ${conversationsCreated}`)
  console.log(`Messages: ${messagesCreated}`)
  console.log(
    `\nNote: ${CONVERSATIONS.filter((c) => c.isTest).length} test conversations will be excluded from analytics`,
  )
}

seedTestConversations().catch((e) => {
  console.error("Seed failed:", e)
  process.exit(1)
})
