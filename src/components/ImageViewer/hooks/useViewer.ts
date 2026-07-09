import { useState } from "react";
import { ImageViewerItem } from "../types";


interface UseViewerProps {

  images: ImageViewerItem[];

  focusIndex?: number;

}


export function useViewer({
  images,
  focusIndex = 0,

}: UseViewerProps){


const [currentIndex,setCurrentIndex] =
useState(focusIndex);



const currentImage =
images[currentIndex];



function next(){

 setCurrentIndex((index)=>{

   if(index >= images.length - 1){
      return index;
   }

   return index + 1;

 });

}



function previous(){

 setCurrentIndex((index)=>{

   if(index <= 0){
      return index;
   }

   return index - 1;

 });

}



function goTo(index:number){

 if(
 index < 0 ||
 index >= images.length
 ){
   return;
 }

 setCurrentIndex(index);

}



return {

 currentIndex,

 currentImage,

 next,

 previous,

 goTo,

 hasNext:
 currentIndex < images.length - 1,


 hasPrevious:
 currentIndex > 0

};

}