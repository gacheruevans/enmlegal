import React from 'react';


const AppWrap = <P extends object>(
  Component: React.ComponentType<P>,
  idName: string,
  classNames: string
) =>
  function HOC(props: P) {
    return (
      <div id={idName} className={`app_container ${classNames}`}>
        <Component {...props} />
      </div>
    );
  };

export default AppWrap;