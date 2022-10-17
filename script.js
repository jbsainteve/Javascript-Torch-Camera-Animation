// Les lignes GIT
// --------------
// git branch -M main
// git remote add origin https://github.com/jbsainteve/Javascript-Torch-Camera-Animation.git
// git push -u origin main

let CANVAS, CTX, VIDEO;
const COLOR =[0,50,190];  // couleur RGB de référence recherchée dans l'image
                          // ici c'est bleu foncé (bouchon d'un stylo bleu)
const THRESHOLD=80;       // Seuil de tolérance, distance euclidienne

function main(){
    CANVAS=document.getElementById("myCanvas");
    CTX=CANVAS.getContext("2d");

    navigator.mediaDevices.getUserMedia({video:true})
        .then(function(rawData){
            VIDEO=document.createElement("video");
            VIDEO.srcObject=rawData;
            VIDEO.play();
            VIDEO.onloadeddata=animateTorchEffect;
        }).catch(function(err){alert(err)})
}

function animateTorchEffect(){
    CANVAS.width=VIDEO.videoWidth;
    CANVAS.height=VIDEO.videoHeight;
    CTX.drawImage(VIDEO,0,0,CANVAS.width,CANVAS.height);

    const locs=[];
    const {data}=CTX.getImageData(0,0,CANVAS.width,CANVAS.height);
    // Chaque pixel est représenté par 4 données RGB et alpha (la transparence)
    // Seules les données RGB nous intéressent ici
    for(let i=0;i<data.length;i+=4){
        const r=data[i];
        const g=data[i+1];
        const b=data[i+2];

        // On compare la distance RGB du pixel avec le RGB de la couleur de référence
        // avec une tolérance de THRESHOLD. Si on a un match, on stocke les coordonnées du pixel 
        // dans le tableau locs
        if(distance([r,g,b],COLOR)<THRESHOLD){
            const x = (i/4)%CANVAS.width;
            const y = Math.floor((i/4)/CANVAS.width);
            locs.push({x,y});
        }
    }
    
    // SI on a de pixels correspondant à la couleur de référence
    if(locs.length>0){

        // On détermine le barycentre des pixels qui ont matché
        const center={x:0,y:0};
        for(let i=0;i<locs.length;i++){
            center.x+=locs[i].x;
            center.y+=locs[i].y;
        }
        center.x/=locs.length;
        center.y/=locs.length;
        
        // On détermine un rayon avec un peu de random
        let rad=Math.sqrt(CANVAS.width*CANVAS.width+
                CANVAS.height*CANVAS.height);
        rad+=Math.random()*0.1*rad;
        
        const grd=CTX.createRadialGradient(
            center.x,center.y,rad*0.05,
            center.x,center.y,rad*0.2
        )
        grd.addColorStop(0,"rgba(0,0,0,0)");
        grd.addColorStop(1,"rgba(0,0,0,0.8)");

        CTX.fillStyle=grd;
        CTX.arc(center.x,center.y,rad,0,Math.PI*2);
        CTX.fill();
    }else{ 
        // Il n'y a pas de pixel correspondant à la couleur de référence
        // On trace un rectangle un peu sombre par dessus l'image de la caméra
        CTX.fillStyle="rgba(0,0,0,0.8)";
        CTX.rect(0,0,CANVAS.width,CANVAS.height);
        CTX.fill();
    }
    requestAnimationFrame(animateTorchEffect);
}

// Calcul de la distance euclidienne entre les couleurs RGB de deux pixels
// Chaque pixel a une couleur RGB ça fait 3 coordonnées. On peut donc calculer une distance 
// dans le référentiel des couleurs. On compare ensuite cette distance au THRESHOLD 
function distance(v1,v2){
    return Math.sqrt((v1[0]-v2[0])*(v1[0]-v2[0])+
    (v1[1]-v2[1])*(v1[1]-v2[1])+
    (v1[2]-v2[2])*(v1[2]-v2[2]));
}