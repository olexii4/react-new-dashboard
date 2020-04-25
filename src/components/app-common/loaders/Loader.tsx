import React from 'react';
import { useSelector } from 'react-redux';

const Loader = (): React.ReactElement => {
  const branding = useSelector((state: { branding: { loaderURL: string } }) => state.branding);

  return <div className='main-page-loader'>
    <div className='ide-page-loader-content'>
      <img src={branding.loaderURL} />
    </div>
  </div>;
};

export default Loader;
