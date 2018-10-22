/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 import React from 'react';
 // import Header from './Header';
 import TreeView from './TreeView';

 export default function ObjectFields({value}) {
   if (value === null || typeof value !== 'object') {
     return <TreeView nodeLabel={value} />;
   }
   const obj = value;
   let header;
   let body;

   return (
     <ul>
       {Object.keys(value).map(key => {
         const subValue = obj[key];
         if (subValue === null || typeof subValue !== 'object') {
           header = (
             <TreeView key={key}>
               <span>{nodeLabel={subValue}}</span>
             </TreeView>
           )
           body = null;
         } else {
           header = <TreeView key={key} />;
           body = <ObjectFields value={subValue} />;
         }
         return (
           <li key={key}>
             {header}
             {body}
           </li>
         );
       })}
     </ul>
   );
 }
