'use client'

import { ConfigProvider, theme as antdTheme } from 'antd'
import { useTheme } from 'next-themes'

const AntdProvider = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme()

  return (
    <ConfigProvider
      theme={{
        algorithm:
          resolvedTheme === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default AntdProvider
