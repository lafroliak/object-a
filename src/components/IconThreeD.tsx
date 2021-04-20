import * as React from 'react'

function IconThreeD(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.876.64a1.75 1.75 0 00-1.75 0l-8.25 4.762a1.75 1.75 0 00-.875 1.515v9.525c0 .625.334 1.203.875 1.516l8.25 4.762a1.75 1.75 0 001.75 0l8.25-4.762A1.75 1.75 0 0022 16.442V6.917a1.75 1.75 0 00-.875-1.515L12.876.639zm-1 1.298a.25.25 0 01.25 0l7.625 4.402-7.75 4.474-7.75-4.474 7.625-4.402zM3.501 7.64v8.803c0 .09.048.172.125.217l7.625 4.401v-8.947l-7.75-4.474zm9.25 13.421l7.625-4.401a.25.25 0 00.125-.217V7.639l-7.75 4.474v8.947z"
        fill="currentColor"
      />
    </svg>
  )
}

export default React.memo(IconThreeD)
