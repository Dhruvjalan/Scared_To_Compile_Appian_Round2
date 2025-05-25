"use client"

import React from "react";

export default function AiText({ message }) {
    return(

        <div
  className="max-w-md p-4 rounded-2xl shadow-inner flex flex-col mr-auto my-5"
  style={{ backgroundColor: 'hsl(var(--aicard))', color: 'hsl(var(--aicard-foreground))' }}
>
  <p className="text-sm">{message}</p>
</div>     
    )
}