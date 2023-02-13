// See https://aka.ms/new-console-template for more information
using OpenCvSharp;

using (var t = new ResourcesTracker())
{
    var src = t.T(new Mat(@"tractor.png", ImreadModes.Grayscale));
    var dst = t.NewMat();
    Cv2.Canny(src, dst, 50, 200);
    var blurredDst = t.T(dst.Blur(new Size(3, 3)));
    t.T(new Window("src image", src));
    t.T(new Window("dst image", blurredDst));

    
    Cv2.WaitKey();
}