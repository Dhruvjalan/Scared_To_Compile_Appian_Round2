"use client"

import React from "react";

export default function HumanText({ message }) {
    return(

        <div className="max-w-md bg-gray-100 p-4 rounded-2xl shadow-inner flex flex-col ml-auto my-5">
              <p className="text-sm text-gray-800">{message}</p>
            </div>
    )
}