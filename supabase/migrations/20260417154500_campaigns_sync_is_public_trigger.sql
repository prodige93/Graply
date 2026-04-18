/*
  # Trigger: sync campaigns.is_public from require_application

  Ensures is_public stays aligned when require_application changes, without relying
  on the app to send is_public (avoids drift and works for API/SQL updates).
*/

CREATE OR REPLACE FUNCTION campaigns_sync_is_public_from_require_application()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_public := NOT COALESCE(NEW.require_application, false);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_campaigns_sync_is_public ON campaigns;

CREATE TRIGGER trg_campaigns_sync_is_public
  BEFORE INSERT OR UPDATE OF require_application ON campaigns
  FOR EACH ROW
  EXECUTE PROCEDURE campaigns_sync_is_public_from_require_application();
