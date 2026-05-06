import React from 'react';
 
export function HomepageDocente() {
  return (
    <div className="flex flex-col items-end justify-center h-full w-full">
        <div className="p-10">
            <p className="text-5xl text-gray-700 mb-8 font-medium">
                Bem Vindo(a) ao Sistema de Conselho de Classe
            </p>
            <div className="flex flex-col items-end">
                <img
                src="/img/logo-senai.png"
                alt="Logo SENAI Mariano Ferraz"
                className="w-[400px]  object-contain"
                />
                <p className="text-3xl font-bold tracking-widest text-gray-900 mt-3 uppercase">
                Mariano Ferraz
                </p>
            </div>
        </div>
    </div>
  );
}