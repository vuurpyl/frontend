```js
import React, { Suspense } from 'react';

import ButtonBurger from './index';

const ButtonBurgerExample = () => (
  <Suspense fallback="Loading...">
    <ButtonBurger />
  </Suspense>
);

  <ButtonBurgerExample />;
```
