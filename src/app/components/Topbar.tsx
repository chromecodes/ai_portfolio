import * as React from 'react';

export interface ITopbarProps {
}

export default function Topbar (props: ITopbarProps) {
  return (
    <div>
      <div className="topbar">
        <div className="ctrlcnt">
            <ul>
            <li className="ctrl">Home</li>
            <li className="ctrl">Project</li>
            <li className="ctrl">Experience</li>
            <li className="ctrl">Contact</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
