import {AfterViewInit, Component} from "@angular/core";
import AgoraRTC, {IAgoraRTCClient} from "agora-rtc-sdk-ng";
import AgoraRTM, {RtmChannel, RtmClient} from "agora-rtm-sdk"
import {SteerCommand} from "../../models/steer-command";
import {doesNotThrow} from "assert";

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

  agoraEngine: IAgoraRTCClient;
  rtmClient: RtmClient;

  localPlayerContainer: any;
  remotePlayerContainer: any;

  rtmChannel?: RtmChannel;

  localSteerCommands: SteerCommand = {}
  lastSendSteerCommands: SteerCommand = {};

  joined = false;

  constructor() {
// Create an instance of the Agora Engine
    this.agoraEngine = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
    this.rtmClient = AgoraRTM.createInstance(this.appId);


  }


  async onJoinClick() {
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
    this.agoraEngine.on("user-published", async (user, mediaType) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event.
      await this.agoraEngine.subscribe(user, mediaType);
      console.log("subscribe success");
      // Subscribe and play the remote video in the container If the remote user publishes a video track.
      if (mediaType == "video") {
        // Retrieve the remote video track.
        this.remoteVideoTrack = user.videoTrack;
        // Retrieve the remote audio track.
        this.remoteAudioTrack = user.audioTrack;
        // Save the remote user id for reuse.
        this.remoteUid = user.uid.toString();
        // Specify the ID of the DIV container. You can use the uid of the remote user.
        this.remotePlayerContainer.id = user.uid.toString();
        this.remoteUid = user.uid.toString();
        this.remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
        // Append the remote container to the page body.
        (document.getElementById("remote-wrapper") as any).append(this.remotePlayerContainer);
        // Play the remote video track.
        this.remoteVideoTrack.play(this.remotePlayerContainer);
      }
      // Subscribe and play the remote audio track If the remote user publishes the audio track only.
      if (mediaType == "audio") {
        // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
        this.remoteAudioTrack = user.audioTrack;
        // Play the remote audio track. No need to pass any DOM element.
        this.remoteAudioTrack.play();
      }
      // Listen for the "user-unpublished" event.
      this.agoraEngine.on("user-unpublished", user => {
        console.log(user.uid + "has left the channel");
      });
    });

    this.joined = true;

    await this.join();
  }

  async ngAfterViewInit() {

    setTimeout(()=>{
      window.location.reload();
    }, 60 * 60 * 2); // Refresh page after two hours -> to prevent resource drainage

    setTimeout(() => {


      window.onkeydown = (e: KeyboardEvent) => {
        console.log("Key down: ", e);

        switch (e.key) {
          case "w":
            this.localSteerCommands.f = true;
            break;

          case "s":
            this.localSteerCommands.b = true;
            break;

          case "a":
            this.localSteerCommands.l = true;
            break;

          case "d":
            this.localSteerCommands.r = true;
            break;
        }

        this.sendPosition(true).then();

      }

      window.onkeyup = (e: KeyboardEvent) => {

        switch (e.key) {
          case "w":
            this.localSteerCommands.f = false;
            break;

          case "s":
            this.localSteerCommands.b = false;
            break;

          case "a":
            this.localSteerCommands.l = false;
            break;

          case "d":
            this.localSteerCommands.r = false;
            break;
        }

        this.sendPosition(true).then();
      }

      console.log("Key bindings set");
    }, 3000);


  }

  async sendPosition(dontSendIfSame = false) {

    if (dontSendIfSame) {
      if (JSON.stringify(this.localSteerCommands) === JSON.stringify(this.lastSendSteerCommands)) {
        return;
      }
    }

    console.log("Send position: ", this.localSteerCommands)

    this.rtmChannel?.sendMessage({
      text: JSON.stringify(this.localSteerCommands),
    });

    this.lastSendSteerCommands = {...this.localSteerCommands};

  }

  // Listen to the Join button click event.
  async join() {

    // Join a channel.
    await this.agoraEngine.join(this.appId, this.channel, this.token, this.uid);

    await this.rtmClient.login({uid: Date.now().toString(), token: undefined});

    this.rtmChannel = await this.rtmClient.createChannel("vehicle1");

    this.rtmChannel.on("ChannelMessage", (message, memberId) => {

      if (!message.text) {
        return;
      }

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

    setInterval(async () => {
      await this.sendPosition();
    }, 2000)

  }

  // Listen to the Leave button click event.
  async leave() {
    // Destroy the local audio and video tracks.
    this.localAudioTrack.close();
    this.localVideoTrack.close();
    // Remove the containers you created for the local video and remote video.
    this.removeVideoDiv(this.remotePlayerContainer.id);
    this.removeVideoDiv(this.localPlayerContainer.id);
    // Leave the channel
    await this.agoraEngine.leave();
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
