using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/*
 *	Ability class
 *	All player abilities inherit from this
 *
 *	Player abilities should fall into 2 Categories
 *		1. Movement abilities
 *			Jumping abilities (i.e. double jump, long jump)
 *			Dashing abilities (i.e. sprint, dive)
 *		2. Role-Based abilties
 *			These abilities will vary wildly, but will be focussed on the 3 primary roles (light, support, heavy)
 */
public abstract class Ability : MonoBehaviour
{	
	public AbilityData abilityData {get; set;}
	public CharacterBuildScript player {get; private set;}
	public float cooldownRemaining {get; protected set;}

	/*
	 *	Is the ability ready to cast yet?
	 */
	public abstract bool CanCast();

	/*
	 *	Returns the ability to the "ready to cast" state, as if it has not been casted, and any cooldowns have been cleared
	 */
	public abstract void Reset();

	/*
	 *	Casts the ability at the provided position, with the provided rotation
	 *		Ensures that all clients create the ability in the same place
	 */
	public abstract void Cast(Vector3 castLoc, Quaternion castDir);

	/*
	 *	Returns the current cast rotation of the ability
	 */
	public abstract Quaternion GetCastDirection();

	/*
	 *	Returns the current cast position of the ability
	 */
	public abstract Vector3 GetCastPosition();

	/*
	 *	Draws the label for this ability
	 *	Assumes this label is within a appropriate bounding box
	 */
	public abstract void DrawGUILabel();

	/*
	 *	Saves a reference to the provided player build that this ability should be attached to
	 */
	public void AddPlayer(CharacterBuildScript build)
	{
		player = build;
	}

	/*
	 * 	Sets this ability's cooldown as ready to cast
	 */
	public void ClearCooldown()
	{
		cooldownRemaining = 0f;
	}

	/*
	 * 	Sets this ability's cooldown to it's maximum value
	 */
	public virtual void ResetCooldown()
	{
		cooldownRemaining = abilityData.cooldownLength;
	}

	/*
	 *	Standard cooldown timer for abilities.  Begins the coroutine that counts the cooldown on the ability.
	 *	Should be called in the Awake and Reset methods of any abilities with cooldowns
	 */
	public void StartCooldownCounter()
	{
		StartCoroutine(CooldownCounter());
	}

	/*
	 * 	Coroutine for counting down the cooldown on the ability
	 */
	public IEnumerator CooldownCounter()
	{
		while(true)
		{
			cooldownRemaining -= Time.deltaTime;
			yield return 0;
		}
	}

	/*
	 *	Draws a standard label containing only the cooldown (in red), until the ability is ready to cast, then "Ready" (in green)
	 */
	protected void DrawCooldownLabel()
	{
		//grab the current GUI color, so we can modify it
		Color guiColor = GUI.color;
		
		if(cooldownRemaining > 0)
		{
			GUI.color = Color.red;
			GUILayout.Label(Mathf.CeilToInt(cooldownRemaining).ToString());
		}
		else
		{
			GUI.color = Color.green;
			GUILayout.Label("Ready");
		}
		
		//reset the GUI color to it's previous value
		GUI.color = guiColor;	
	}
}