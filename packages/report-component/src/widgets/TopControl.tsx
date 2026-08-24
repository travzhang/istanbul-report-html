import Icon, { BarsOutlined } from '@ant-design/icons'
import { Divider, Input, Segmented, Space } from 'antd'
import type { FC } from 'react'
import PhTreeViewIcon from '../icons/PhTreeView'

const TopControl: FC<{
  total: number
  showMode: string
  filenameKeywords: string
  onChangeShowMode: (mode: string) => void
  onChangeKeywords: (word: string) => void
}> = ({ total, showMode, onChangeShowMode, onChangeKeywords, filenameKeywords }) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          marginBottom: '6px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
          <Space>
            <Segmented
              size="small"
              value={showMode}
              onChange={(v) => {
                onChangeShowMode(String(v))
              }}
              options={[
                {
                  label: 'Code Tree',
                  value: 'tree',
                  icon: <Icon component={PhTreeViewIcon} />,
                },
                {
                  label: 'File List',
                  value: 'list',
                  icon: <BarsOutlined />,
                },
              ]}
            />
            <span style={{ fontSize: '14px' }}>
              {total} {'Total Files'}
            </span>
          </Space>
        </div>
        <Input
          placeholder="Enter the file path to search"
          value={filenameKeywords}
          style={{ width: '240px' }}
          size="small"
          onChange={(val) => {
            onChangeKeywords(val.target.value)
          }}
        />
      </div>
      <Divider style={{ margin: '0', marginBottom: '6px' }} />
    </div>
  )
}

export default TopControl
