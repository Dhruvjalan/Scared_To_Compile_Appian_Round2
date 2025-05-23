"use client"

import React from "react";

export default function AiText({ message }) {
    return(

        <div className="max-w-md bg-gray-800 p-4 rounded-2xl shadow-inner flex flex-col mr-auto my-5">
              <p className="text-sm text-gray-100">{message}</p>
            </div>
    )
}