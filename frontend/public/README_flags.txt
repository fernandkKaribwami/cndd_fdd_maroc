POUR UTILISER UNE VRAIE IMAGE DU DRAPEAU CNDD-FDD :

1. Copie l'image du drapeau dans ce dossier (frontend/public/)
   et nomme-la : cndd_flag.png  (ou .jpg ou .svg)

2. Dans FloatingFlags.tsx, remplace le composant DrapeauCNDD par :

   import Image from "next/image";

   function DrapeauCNDD({ width = 56, opacity = 1 }) {
     return (
       <Image
         src="/cndd_flag.png"
         alt="Drapeau CNDD-FDD"
         width={width}
         height={Math.round(width * 0.6)}
         style={{ opacity, borderRadius: 2, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
       />
     );
   }

C'est tout ! Les drapeaux flottants utiliseront automatiquement ta vraie image.
