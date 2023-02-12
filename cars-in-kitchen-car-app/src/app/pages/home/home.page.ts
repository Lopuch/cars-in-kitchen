import {AfterViewInit, Component} from "@angular/core";
import AgoraRTC, {IAgoraRTCClient} from "agora-rtc-sdk-ng";
import AgoraRTM, {RtmChannel, RtmClient} from "agora-rtm-sdk";
import {SteerCommand} from "../../models/steer-command";
import {VehicleService} from "../../services/vehicle/vehicle.service";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements AfterViewInit {

  // Pass your App ID here.
  appId = "160404e73e3444078e6676c09960f1e5";
  // Set the channel name.
  channel = "hole";
  // Pass your temp token here.
  token = null;
  // Set the user ID.
  uid = null;


  // A variable to hold a local audio track.
  localAudioTrack: any;
  // A variable to hold a local video track.
  localVideoTrack: any;
  // A variable to hold a remote audio track.
  remoteAudioTrack: any;
  // A variable to hold a remote video track.
  remoteVideoTrack: any;
  // A variable to hold the remote user id.s
  remoteUid: any;

  rtcEngine: IAgoraRTCClient;
  rtmClient: RtmClient;

  localPlayerContainer: any;
  remotePlayerContainer: any;

  rtmChannel?: RtmChannel;

  constructor(
    public vehicleService: VehicleService,
  ) {

    this.rtcEngine = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
    this.rtmClient = AgoraRTM.createInstance(this.appId);

  }

  async ngAfterViewInit() {

    // Dynamically create a container in the form of a DIV element to play the remote video track.
    this.remotePlayerContainer = document.createElement("div");
    // Dynamically create a container in the form of a DIV element to play the local video track.
    this.localPlayerContainer = document.createElement("div");
    // Specify the ID of the DIV container. You can use the uid of the local user.
    this.localPlayerContainer.id = this.uid;
    // Set the textContent property of the local video container to the local user id.
    this.localPlayerContainer.textContent = "Local user " + this.uid;
    // Set the local video container size.
    this.localPlayerContainer.style.width = "640px";
    this.localPlayerContainer.style.height = "480px";
    this.localPlayerContainer.style.padding = "15px 5px 5px 5px";
    // Set the remote video container size.
    this.remotePlayerContainer.style.width = "640px";
    this.remotePlayerContainer.style.height = "480px";
    this.remotePlayerContainer.style.padding = "15px 5px 5px 5px";
    // Listen for the "user-published" event to retrieve a AgoraRTCRemoteUser object.
    this.rtcEngine.on("user-published", async (user, mediaType) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event.
      await this.rtcEngine.subscribe(user, mediaType);
      console.log("subscribe success");
      // Subscribe and play the remote video in the container If the remote user publishes a video track.
      // if (mediaType == "video") {
      //   // Retrieve the remote video track.
      //   this.remoteVideoTrack = user.videoTrack;
      //   // Retrieve the remote audio track.
      //   this.remoteAudioTrack = user.audioTrack;
      //   // Save the remote user id for reuse.
      //   this.remoteUid = user.uid.toString();
      //   // Specify the ID of the DIV container. You can use the uid of the remote user.
      //   this.remotePlayerContainer.id = user.uid.toString();
      //   this.remoteUid = user.uid.toString();
      //   this.remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
      //   // Append the remote container to the page body.
      //   (document.getElementById("remote-wrapper") as any).append(this.remotePlayerContainer);
      //   // Play the remote video track.
      //   this.remoteVideoTrack.play(this.remotePlayerContainer);
      // }
      // // Subscribe and play the remote audio track If the remote user publishes the audio track only.
      // if (mediaType == "audio") {
      //   // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
      //   this.remoteAudioTrack = user.audioTrack;
      //   // Play the remote audio track. No need to pass any DOM element.
      //   this.remoteAudioTrack.play();
      // }
      // Listen for the "user-unpublished" event.
      this.rtcEngine.on("user-unpublished", user => {
        console.log(user.uid + "has left the channel");
      });
    });

    await this.join();
  }

  // Listen to the Join button click event.
  async join() {


    const joinVideo = false;
    if(joinVideo) {
      // Join a channel.
      await this.rtcEngine.join(this.appId, this.channel, this.token, this.uid);

      // Create a local audio track from the audio sampled by a microphone.
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      // Create a local video track from the video captured by a camera.
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

      // Append the local video container to the page body.
      (document.getElementById("local-wrapper") as any).append(this.localPlayerContainer);
      // Publish the local audio and video tracks in the channel.
      await this.rtcEngine.publish([this.localAudioTrack, this.localVideoTrack]);
      // Play the local video track.
      this.localVideoTrack.play(this.localPlayerContainer);
      console.log("publish success!");
    }


    await this.rtmClient.login({uid: Date.now().toString(), token: undefined});

    this.rtmChannel = await this.rtmClient.createChannel("vehicle1");

    this.rtmChannel.on("ChannelMessage", (message, memberId) => {

      if (!message.text) {
        return;
      }

      this.vehicleService.setInput(JSON.parse(message.text));

    })
    // Display channel member stats
    this.rtmChannel.on("MemberJoined", function (memberId) {

      console.log(memberId + " joined the channel");

    })
    // Display channel member stats
    this.rtmChannel.on("MemberLeft", function (memberId) {

      console.log(memberId + " left the channel");

    })

    await this.rtmChannel.join();

  }

  // Listen to the Leave button click event.
  async leave() {
    // Destroy the local audio and video tracks.
    this.localAudioTrack.close();
    this.localVideoTrack.close();
    // Remove the containers you created for the local video and remote video.
    // this.removeVideoDiv(this.remotePlayerContainer.id);
    this.removeVideoDiv(this.localPlayerContainer.id);
    // Leave the channel
    await this.rtcEngine.leave();
    console.log("You left the channel");
    // Refresh the page for reuse
    window.location.reload();
  }


  removeVideoDiv(elementId: any) {
    console.log("Removing " + elementId + "Div");
    let Div = document.getElementById(elementId);
    if (Div) {
      Div.remove();
    }
  };

}
