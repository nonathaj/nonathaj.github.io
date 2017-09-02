using UnityEngine;
using System.Collections;

/*
 *	AbilityBoxDropScript class
 *		inherits from the Ability class
 *
 *	Creates a box a few units above where the player is aiming at
 */
public class AbilityBoxDropScript : Ability 
{
	CameraControllerScript cam;		//The camera controller that handles all camera movement and camera switching
	GameObject box;					//The object that is created for this ability
	Vector3 castPos;				//The position the ability is being cast at.

	void Awake()
	{
		GameObject game = GameObject.FindGameObjectWithTag("GameController");

		if(networkView.isMine)
			cam = game.GetComponent<CameraControllerScript>();
		else
			cam = null;

		box = (GameObject)Resources.Load("BoxDropObject");

		castPos = Vector3.zero;
		ClearCooldown();
	}

	/*
	 *	AbilityBoxDrop has a standard gui label, comprised of simply the cooldown timer
	 */
	public override void DrawGUILabel()
	{
		DrawCooldownLabel();
	}

	public override void Reset()
	{
		ClearCooldown();
		StartCooldownCounter();
	}
	
	public override bool CanCast()
	{
		return cooldownRemaining <= 0 && GetCastPosition() != Vector3.zero;
	}
	
	public override void Cast(Vector3 castLoc, Quaternion castDir)
	{
		if(networkView.isMine)
		{
			//Network instantiates the gameobject for the ability, and sets the relevant caster/caster client on the object, for score handling
			GameObject obj = (GameObject)Network.Instantiate (box, castLoc, castDir, (int)NetworkGroup.GAME);
			obj.networkView.RPC("SetCaster", RPCMode.All, player.networkView.viewID);
			obj.networkView.RPC("SetCasterClient", RPCMode.All, player.build.owner);
		}
		ResetCooldown();

		//after we cast, we need to reset the cast position, so we don't incorrectly double calculate it
		castPos = Vector3.zero;
	}
	
	public override Quaternion GetCastDirection() { return Quaternion.identity; }
	
	public override Vector3 GetCastPosition()
	{
		//this check saves us from double raycasting to find the cast position
		//This will get called twice, because when it is checked if the ability can be cast, the position to cast at is calculated.
		//	This check saves us a raycast when activating the ability
		if(castPos != Vector3.zero)
			return castPos;

		//Fires a raycast out from the player to attempt to hit someone.
		RaycastHit hitInfo;
		if( Physics.Raycast(cam.GetCameraPosition(), cam.GetCameraRotation() * Vector3.forward, out hitInfo, 100f) )		//there is an object we are trying to hit
		{
			castPos = hitInfo.point + new Vector3(0f, 4f, 0f);			//the object will be created 4 world units above the place the player hit with the raycast
			return castPos;
		}
		else 																												//there is no object where we are aiming
			return Vector3.zero;
	}
}
