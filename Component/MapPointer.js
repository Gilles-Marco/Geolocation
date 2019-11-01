import React from "react";

import {
    View,
    Platform,
    PermissionsAndroid,
    StyleSheet,
} from "react-native";

import MapView from "react-native-maps";

import Geolocation from "react-native-geolocation-service";

import location from "./MapPointerRessource/location.json";

import update from "react-addons-update";

const lightblueColor = "rgba(173, 216, 230, 0.5)";
const redColor = "rgba(255, 0, 0, 0.5)";

export default class MapPointer extends React.Component{

    state = {
        latitude:0,
        longitude:0,
        location:[]
    };

    constructor(props){
        super(props);

        //init des coordonnées
        this.state.latitude = 0;
        this.state.longitude = 0;
        //Init des locations
        this.state.location = location;
        this.state.location.forEach((item)=>{
            item.color = lightblueColor;
        });
    }

    askUserPermission(){
        /**
         * Ask permission to use the GPS location of the user
         */
        return new Promise(async (resolve, reject)=>{
            if(Platform.OS == "android"){
                let granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if(granted === PermissionsAndroid.RESULTS.GRANTED)
                    resolve(true);
            }
            else if(Platform.OS=="ios"); //Par défaut dans le fichier config de IOS
            else; // Si cest du web la permission sera demander au moment du watchPosition par watchPosition
            reject();
        });
    }

    trackPosition(){
        switch(Platform.OS){
            case "web":
            case "macos":
            case "windows":
            //Use navigator.geolocation
                navigator.geolocation.watchPosition((position)=>{
                    this.findPositionCorrelation(position);
                }, (error)=>{
                    console.warn(error);
                }, {"enableHighAccuracy": true});
                break;
            default:
                Geolocation.watchPosition((position)=>{
                    this.findPositionCorrelation(position);
                }, (error)=>{
                    console.warn(error);
                }, {"interval":1000, "distanceFilter":0, "enableHighAccuracy":true});
            break;
        }
    }

    getPosition(){
        return new Promise((resolve, reject)=>{
            switch(Platform.OS){
                case "web":
                case "macos":
                case "windows":
                //Use navigator.geolocation
                    navigator.geolocation.getCurrentPosition((position)=>{
                        resolve(position);
                    }, (error)=>{
                        console.warn(error);
                        reject(error);
                    }, {"enableHighAccuracy": true});
                    break;
                default:
                    Geolocation.getCurrentPosition((position)=>{
                        resolve(position);
                    }, (error)=>{
                        console.warn(error);
                        reject(error);
                    }, {"enableHighAccuracy":true});
                break;
            }
        });
    }

    findPositionCorrelation(position){
        /**
         * @param position : position object given by navigator.getCurrentPosition or Geolocation.getCurrentPosition
         * Try to find if the gps location match with an item in the list of location possible
         */
        this.state.location.forEach((item, index)=>{
            if(this.isInCircle(item.latitude, item.longitude, item.radius, position.coords.latitude, position.coords.longitude)){
                console.log(`MATCH FOUND : Target is near ${item.name}`);
                let buffLocation = this.state.location;
                buffLocation[index].color = redColor;
                this.setState({location: buffLocation});
            }
            else{
                console.log(`Too distant from ${item.name} : ${this.distanceFromLocation(item, position)} or ${Math.round(this.measure(item.latitude, item.longitude, position.coords.latitude, position.coords.longitude), 0)} meters`);
                let buffLocation = this.state.location;
                buffLocation[index].color = lightblueColor;
                this.setState({location: buffLocation});
            }
        });
    }

    isInCircle(cx, cy, cr, tx, ty){
        /**
         * @param cx : center circle x
         * @param cy : center circle y
         * @param cr : circle radius
         * @param tx : target x
         * @param ty : target y
         * 
         * @return true or false if target in the circle
         */
    
        let distance = Math.sqrt(Math.pow(cx-tx, 2) + Math.pow(cy-ty, 2));
        if(distance<cr)
            return true;
        else
            return false;
    }

    distanceFromLocation(location, tCoords){
        return Math.sqrt(Math.pow(location.latitude-tCoords.coords.latitude, 2) + Math.pow(location.longitude-tCoords.coords.longitude, 2));
    }

    measure(lat1, lon1, lat2, lon2){
        //Source : https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
        // generally used geo measurement function
        let R = 6378.137; // Radius of earth in KM
        let dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        let dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let d = R * c;
        return d * 1000; // meters
    }

    async componentDidMount(){
        let authorization = await this.askUserPermission();
        console.log(authorization);
        if(authorization){
            console.log("Launching tracking");
            this.trackPosition();
        }

        let position = await this.getPosition();
        this.setState({"latitude": position.coords.latitude});
        this.setState({"longitude": position.coords.longitude});
    }

    render(){
        return(
            <View style={styles.container}>
                <MapView style={styles.map}
                    region={{
                    latitude: this.state.latitude,
                    longitude: this.state.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0051
                    }}
                    showsUserLocation={true}
                    loadingEnabled={true}
                >
                {
                    this.state.location.map((value, index)=>{
                        return ([
                            <MapView.Marker
                                key={Math.random()+index+20}
                                title={value.name} 
                                coordinate={{latitude:value.latitude, longitude:value.longitude}}
                            />,
                            <MapView.Circle
                                key={Math.random()+index+25}
                                center={{latitude:value.latitude, longitude:value.longitude}}
                                radius={this.measure(value.latitude, value.longitude, value.latitude+value.radius, value.longitude)}
                                fillColor={value.color}
                                stroke={0}
                            />
                        ]);
                    })
                }
                </MapView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end",
      alignItems: 'center',
    },
    map:{
      position: "absolute",
      top: 0,
      left: 0,
      right:0,
      bottom: 0,
    },
  });