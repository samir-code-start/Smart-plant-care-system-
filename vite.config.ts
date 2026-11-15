import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const urlObj = new URL(req.url, 'http://localhost')
        const endpoint = urlObj.pathname.replace('/api/', '')

        const apiFilePath = path.resolve(__dirname, `api/${endpoint}.ts`)
        if (!fs.existsSync(apiFilePath)) {
          return next()
        }

        try {
          // Read request body for POST/PUT
          let body: any = {}
          if (req.method === 'POST' || req.method === 'PUT') {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(chunk)
            }
            const rawBody = Buffer.concat(chunks).toString()
            if (rawBody) {
              try {
                body = JSON.parse(rawBody)
              } catch {
                body = {}
              }
            }
          }

          // Parse query parameters
          const query: Record<string, string> = {}
          urlObj.searchParams.forEach((val, key) => {
            query[key] = val
          })

          // Attach to req & res to conform to Vercel Serverless Function interface
          ;(req as any).query = query
          ;(req as any).body = body

          ;(res as any).status = function (code: number) {
            res.statusCode = code
            return res
          }
          ;(res as any).json = function (data: any) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return res
          }

          // Load and run the API module via Vite SSR
          const mod = await server.ssrLoadModule(apiFilePath)
          const handler = mod.default || mod
          await handler(req, res)
        } catch (error: any) {
          console.error(`[API Dev Server Error] ${req.url}:`, error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: error.message }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
  }
})
