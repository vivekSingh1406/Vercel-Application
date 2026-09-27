import Foundation
import AVFoundation
import AppKit
let base = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let files = try FileManager.default.contentsOfDirectory(at: base.appendingPathComponent("images"), includingPropertiesForKeys: nil).filter { $0.pathExtension == "mp4" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
for (index, file) in files.enumerated() {
 let asset = AVURLAsset(url:file)
 let generator = AVAssetImageGenerator(asset:asset)
 generator.appliesPreferredTrackTransform = true
 generator.maximumSize = CGSize(width:1920,height:1920)
 do {
  let raw = try generator.copyCGImage(at:CMTime(seconds:index == 4 ? 25 : 12,preferredTimescale:600),actualTime:nil)
  let cg = index == 1 ? raw.cropping(to:CGRect(x:0,y:656,width:1080,height:608))! : index == 3 ? raw.cropping(to:CGRect(x:108,y:0,width:864,height:1920))! : raw
  let rep = NSBitmapImageRep(cgImage:cg)
  let data = rep.representation(using:.jpeg,properties:[.compressionFactor:0.82])!
  try data.write(to:base.appendingPathComponent("public/media/village-\(index+1).jpg"))
  print("\(index+1): \(file.lastPathComponent), \(CMTimeGetSeconds(asset.duration))s, \(cg.width)x\(cg.height)")
 } catch { print(error) }
}
